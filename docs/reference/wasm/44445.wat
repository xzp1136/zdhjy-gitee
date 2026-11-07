  (func (;44445;) (type 16) (param i32 i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 7
    global.set 0
    i32.const 4367455
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3357576
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3480604
      call 2180
      i32.const 4367455
      i32.const 1
      i32.store8
    end
    i32.const 3360788
    i32.load
    local.tee 6
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 6
      call 60460
    end
    i32.const 0
    local.set 6
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 3
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      block  ;; label = @2
        local.get 0
        local.get 2
        local.get 3
        local.get 3
        call 44446
        local.tee 8
        i32.load offset=12
        local.get 3
        i32.ge_s
        br_if 0 (;@2;)
        i32.const 3357576
        i32.load
        local.tee 6
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 6
          call 60460
        end
        i32.const 4367470
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3357576
          call 2180
          i32.const 4367470
          i32.const 1
          i32.store8
        end
        i32.const 3357576
        i32.load
        local.tee 6
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 6
        else
          local.get 6
          call 60460
          i32.const 3357576
          i32.load
        end
        i32.load offset=92
        i32.load
        local.get 1
        i32.load offset=108
        local.get 2
        i32.const 0
        call 41050
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        local.get 2
        local.get 3
        local.get 3
        call 44446
        local.set 8
      end
      local.get 3
      local.get 8
      i32.load offset=12
      i32.gt_s
      if  ;; label = @2
        local.get 7
        local.get 3
        i32.store offset=12
        i32.const 0
        local.set 6
        i32.const 3359088
        i32.load
        local.get 7
        i32.const 12
        i32.add
        call 2193
        local.set 3
        local.get 7
        local.get 8
        i32.load offset=12
        i32.store offset=8
        i32.const 3359088
        i32.load
        local.get 7
        i32.const 8
        i32.add
        call 2193
        local.set 1
        local.get 7
        local.get 2
        i32.store offset=4
        i32.const 3359088
        i32.load
        local.get 7
        i32.const 4
        i32.add
        call 2193
        local.set 2
        i32.const 3480604
        i32.load
        local.get 3
        local.get 1
        local.get 2
        i32.const 0
        call 48228
        local.set 3
        i32.const 3356428
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        local.get 3
        i32.const 0
        call 55817
        br 1 (;@1;)
      end
      i32.const 4367457
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3367844
        call 2180
        i32.const 4367457
        i32.const 1
        i32.store8
      end
      i32.const 3367844
      i32.load
      call 1900
      local.tee 3
      i32.const 0
      i32.const 0
      call 2298
      local.get 3
      local.get 5
      i32.store offset=28
      local.get 3
      local.get 4
      i32.store8 offset=24
      local.get 3
      local.get 8
      i32.store offset=16
      local.get 3
      local.get 1
      i32.store offset=20
      local.get 0
      local.get 3
      i32.const 0
      call 48887
      drop
      i32.const 1
      local.set 6
    end
    local.get 7
    i32.const 16
    i32.add
    global.set 0
    local.get 6)
