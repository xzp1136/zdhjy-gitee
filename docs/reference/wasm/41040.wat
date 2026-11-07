  (func (;41040;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 0
    local.set 2
    i32.const 4365134
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388080
      call 2180
      i32.const 3388084
      call 2180
      i32.const 4365134
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=60
      local.tee 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 5
        local.get 4
        local.get 3
        i32.const 12
        i32.add
        i32.const 3388084
        i32.load
        call 50458
        local.get 1
        local.get 3
        i32.load offset=12
        local.tee 2
        i32.load offset=20
        i32.eq
        if  ;; label = @3
          local.get 2
          i32.load offset=28
          i32.eqz
          br_if 2 (;@1;)
        end
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 0
        i32.load offset=60
        local.tee 5
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
      i32.const 0
      local.set 2
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0
    local.get 2)
