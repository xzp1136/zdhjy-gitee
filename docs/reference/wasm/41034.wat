  (func (;41034;) (type 12) (param i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4365135
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375576
      call 2180
      i32.const 3387156
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 4365135
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 2
      i32.load offset=12
      i32.const 1
      i32.sub
      local.tee 0
      local.get 1
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 4
        i32.load offset=28
        local.get 1
        local.get 5
        i32.const 12
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        local.get 5
        i32.load offset=12
        i32.const 0
        local.get 5
        i32.const 12
        i32.add
        i32.const 3387848
        i32.load
        call 50458
        local.get 5
        i32.load offset=12
        local.set 6
        i32.const 3375576
        i32.load
        local.set 7
        local.get 5
        local.get 2
        local.get 1
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        i32.store offset=12
        local.get 3
        local.get 5
        i32.const 12
        i32.add
        local.get 5
        i32.const 8
        i32.add
        local.get 7
        call 34434
        local.get 5
        i32.load offset=8
        i32.load offset=12
        local.get 6
        i32.const 0
        local.get 6
        i32.const 0
        i32.gt_s
        select
        i32.lt_s
        if  ;; label = @3
          local.get 1
          local.set 0
          br 2 (;@1;)
        end
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 0
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 0)
