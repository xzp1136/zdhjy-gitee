  (func (;41007;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4365106
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387224
      call 2180
      i32.const 3389240
      call 2180
      i32.const 3389244
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4365106
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=72
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=72
    end
    local.get 0
    i32.load offset=76
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=76
    end
    local.get 0
    local.get 0
    call 40997
    block  ;; label = @1
      local.get 0
      i32.load offset=52
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=44
      local.tee 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 1
      loop  ;; label = @2
        local.get 2
        local.get 1
        local.get 4
        i32.const 12
        i32.add
        i32.const 3389244
        i32.load
        call 50458
        local.get 0
        local.get 4
        i32.load offset=12
        local.get 0
        call 41006
        local.set 2
        i32.const 3360788
        i32.load
        local.tee 3
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 3
          call 60460
        end
        local.get 2
        i32.const 0
        i32.const 0
        call 48872
        i32.eqz
        if  ;; label = @3
          local.get 0
          local.get 2
          local.get 0
          call 41008
          local.set 3
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          local.get 3
          i32.const 0
          i32.const 0
          call 48812
          if  ;; label = @4
            f32.const 0x0p+0 (;=0;)
            f32.const 0x1p+0 (;=1;)
            i32.const 0
            call 48613
            local.set 6
            local.get 0
            local.get 3
            local.get 0
            f32.load offset=24
            local.get 6
            local.get 0
            call 41009
          end
          local.get 0
          i32.load offset=68
          local.get 2
          i32.const 3387224
          i32.load
          call 50463
        end
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 0
        i32.load offset=44
        local.tee 2
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0)
